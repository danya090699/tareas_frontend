<template>
    <div :style="{'border-width': processes.length ? '3px' : '0px'}"
         style="border-style: dotted; border-color: grey">

        <slot v-if="show === true"/>

        <center v-else-if="typeof(show) == 'object' && show.DMF_LOADING" class="pa-3 my-1">
            <v-icon color="blue" x-large>
                fas fa-spinner fa-pulse
            </v-icon>
            <div v-if="show.message">{{ show.message }}</div>
        </center>

        <div v-else-if="typeof(show) == 'object' && show.DMF_ERROR" class="pa-2">
            <v-alert type="error">
                {{ show.message }}
            </v-alert>
        </div>

        <div v-if="processes.length" class="pa-1">
            <div v-for="(process, i) in processes" class="mt-2">
                <v-alert v-if="process.state == 'waiting'"
                         class="my-0 px-1"
                         dense
                         type="info"
                         text
                         icon="fas fa-spinner fa-pulse">
                    {{ process.message }}
                </v-alert>
                <v-alert v-if="process.state == 'accepted'"
                         class="my-0 px-1"
                         dense
                         type="success"
                         text>
                    {{ process.message }}
                    <template v-slot:append>
                        <v-icon color="green" @click="processes.splice(i, 1)" class="ml-1">
                            far fa-times-circle
                        </v-icon>
                    </template>
                </v-alert>
                <v-alert v-if="process.state == 'rejected'"
                         class="my-0 px-1"
                         dense
                         type="error">
                    {{ process.message }}
                    <template v-slot:append>
                        <v-icon @click="processes.splice(i, 1)" class="ml-1">
                            far fa-times-circle
                        </v-icon>
                    </template>
                </v-alert>
            </div>
        </div>

        <v-dialog v-model="confirm.show"
                  content-class="white pa-3 ma-1"
                  max-width="300px">
            <div class="text-center mb-4">{{ confirm.question }}</div>
            <div class="d-flex justify-space-around">

                <v-btn @click="confirm.show=false"
                       dark
                       color="red">
                    нет
                </v-btn>

                <v-btn @click="confirm.show=false; confirm.callback()"
                       dark
                       color="green">
                    да
                </v-btn>

            </div>
        </v-dialog>

    </div>
</template>

<script>

export default {
    props: ["data"],
    data() {
        return {
            processes: [],
            confirm: {
                show: false,
                question: "Вы уверены, что хотите выполнить это действие?",
                callback: function () {}
            }
        }
    },
    computed: {
        show() {
            if (this.data === undefined) return true;

            for (let val of this.data) {
                if (!this.isData(val)) return val;
            }
            return true;
        }
    },
    methods: {
        query({confirm, files=[], toServer, waiting = "Ожидание ответа", accepted, rejected}) {
            let query = () => {
                let process = {state: "waiting", message: waiting};
                this.processes.push(process);

                Promise.all(files.map(({file, id}) => this.store.uploadFile(file, {action: "create_file", params: {temp_id: id}})))
                .then(() => this.store.request(toServer, {action: true}))
                .then(data => {
                    process.state = "accepted";

                    if (typeof (accepted) == "function") process.message = accepted(data);
                    else if (typeof (accepted) == "string") process.message = accepted;
                    else process.message = "Изменения выполнены успешно.";

                    setTimeout(() => {
                        let i = this.processes.findIndex(item => item == process);
                        this.processes.splice(i, 1);
                    }, 5000);
                })
                .catch(({message}) => {
                    process.state = "rejected";

                    if (typeof (rejected) == "function") process.message = rejected(message);
                    else if (typeof (rejected) == "string") process.message = rejected;
                    else process.message = message;
                })
            }

            if (confirm !== undefined) {
                this.confirm.show = true;
                this.confirm.question = confirm;
                this.confirm.callback = query;
            }
            else query();
        }
    }
}
</script>