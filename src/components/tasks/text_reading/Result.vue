<template>
    <Shell :data="[student_task, teacher_task]">
        <template v-slot:default>
            <CheckedButton v-if="student_id !== undefined"
                       :task_id="task_id"
                       :student_id="student_id"
                       :checked="student_task.checked"/>
            <center class="ma-4">
                <audio :src="student_task.files.audio" controls/>
            </center>
            <div class="px-4" style="font-size: 30px">{{ teacher_task.other_info.text }}</div>
        </template>
    </Shell>
</template>

<script>
import CheckedButton from "../../CheckedButton";

export default {
    props: ["task_id", "student_id"],
    components: { CheckedButton },
    computed: {
        student_task() {
            return this.store.get(["get_student_task", {task_id: this.task_id, student_id: this.student_id}]);
        },
        teacher_task() {
            return this.store.get(["get_teacher_task", {id: this.task_id}]);
        }
    }
}
</script>