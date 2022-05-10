<template>
    <Shell :data="[task]">
        <template v-slot:default>
            <CheckedButton v-if="student_id !== undefined"
                       :task_id="task_id"
                       :student_id="student_id"
                       :checked="task.checked"/>
            <center class="ma-4">
                <audio :src="task.files.audio" controls/>
            </center>
        </template>
    </Shell>
</template>

<script>
import CheckedButton from "../../CheckedButton";

export default {
    props: ["task_id", "student_id"],
    components: { CheckedButton },
    computed: {
        task() {
            return this.store.get(["get_student_task", {task_id: this.task_id, student_id: this.student_id}]);
        }
    }
}
</script>