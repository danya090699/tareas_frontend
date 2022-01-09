<template>
    <Shell :data="[task]">
        <template v-slot:default>
            <center class="ma-4">
                <audio :src="task.files.audio" controls/>
            </center>
        </template>
    </Shell>
</template>

<script>
export default {
    props: ["task_id", "student_id"],
    computed: {
        task() {
            return this.store.get(["get_student_task", {task_id: this.task_id, student_id: this.student_id}]);
        }
    }
}
</script>