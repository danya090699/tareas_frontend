<template>
    <Shell :data="[task_types, teacher_tasks]" class="pa-2">
        <template v-slot:default>
            <v-expansion-panels accordion hover>
                <v-expansion-panel v-for="task_type in task_types">
                    <v-expansion-panel-header color="blue lighten-5">
                        {{ task_type.name }}
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <Shell :ref="task_type.id">
                            <v-simple-table>
                                <tbody>
                                <tr v-for="task in tasks[task_type.id]">
                                    <td @click="edit_task(task_type.key, task.id)">{{ task.name }}</td>
                                    <td style="text-align: right">
                                        <v-btn @click="delete_task(task_type.id, task.id, task.name, task.solved_count)" icon large color="red">
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </td>
                                </tr>
                                </tbody>
                            </v-simple-table>
                        </Shell>

                        <center class="mt-2">
                            <v-btn @click="new_task(task_type.key, task_type.id, task_type.name)">новое задание</v-btn>
                        </center>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </template>
    </Shell>
</template>

<script>
export default {
    inject: ["addScreen"],
    computed: {
        task_types() {
            return this.store.get(["get_task_types", {}])
        },
        teacher_tasks() {
            return this.store.get(["get_teacher_tasks", {}])
        },
        tasks() {
            let res = {};
            for (let {id} of this.task_types) {
                res[id] = [];
            }
            for (let task of this.teacher_tasks) {
                res[task.type_id].push(task);
            }
            return res;
        }
    },
    methods: {
        new_task(key, type_id, type_name) {
            this.addScreen({type: key + "Task", info: {type_id, type_name}});
        },
        edit_task(key, id) {
            this.addScreen({type: key + "Task", info: {id}});
        },
        delete_task(type_id, id, name, solved_count) {
            this.$refs[type_id][0].query({
                confirm: solved_count > 0 ? `Задание ${name} уже выполнили ${solved_count} учеников, все равно удалить?` : `Удалить задание ${name}?`,
                toServer: ["delete_task", {id}],
                waiting: `Удаление задания ${name}`,
                accepted: () => {
                    this.store.load(["get_teacher_tasks", {}]);
                    return `Задание ${name} удалено`;
                },
                rejected(message) {
                    return `При удалении задания ${name} произошла ошибка: ${message}`;
                }
            })
        }
    }
}
</script>