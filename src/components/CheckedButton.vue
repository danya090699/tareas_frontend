<template>
    <center class="py-1">
        <v-btn v-if="!checked" color="success" @click="check">
            <v-icon left>
                mdi-check
            </v-icon>
            Проверено
        </v-btn>
        <div v-else class="success--text">
            <v-icon color="success">
                mdi-check
            </v-icon>
            Проверено
        </div>
    </center>
</template>

<script>
export default {
    props: ["task_id", "student_id", "checked"],
    methods: {
        check() {
            this.store.request(["check_task", {task_id: this.task_id, student_id: this.student_id}], {action: true})
            .then(() => {
                this.store.load(["get_student_task", {task_id: this.task_id, student_id: this.student_id}]);
            })
            .catch(err => console.log(err))
        }
    }
}
</script>
